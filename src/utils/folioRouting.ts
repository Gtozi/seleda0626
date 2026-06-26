/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Determines which folio (A or B) a charge should route to based on charge type,
 * description, and billing profile rules.
 *
 * @param charge - The folio charge to route
 * @param profile - The billing routing profile (may be null)
 * @param billingMode - Current billing mode ('individual' | 'group')
 * @param activeGroupChargeTypes - Charge types that route to Folio A in group mode
 * @returns 'A' for corporate/group billing, 'B' for personal billing
 */
export function getChargeFolio(
  charge: { isVoided?: boolean; type?: string; description?: string; targetFolio?: 'A' | 'B' },
  profile: { corporateBillingOnly?: boolean; primaryTypes?: string[]; secondaryTypes?: string[] } | null,
  billingMode: 'individual' | 'group',
  activeGroupChargeTypes: string[]
): 'A' | 'B' {
  // If charge is voided, route to B by default
  if (charge.isVoided) return 'B';

  // If charge has explicit target folio, respect it
  if (charge.targetFolio === 'A' || charge.targetFolio === 'B') {
    return charge.targetFolio;
  }

  // Group billing mode: route specified charge types to A
  if (billingMode === 'group') {
    const type = getChargeType(charge);
    return activeGroupChargeTypes.includes(type) ? 'A' : 'B';
  }

  // If no profile or not corporate billing only, default to B
  if (!profile || !profile.corporateBillingOnly) return 'B';

  // Check explicit charge type
  if (charge.type) {
    if (profile.primaryTypes?.includes(charge.type)) return 'A';
    if (profile.secondaryTypes?.includes(charge.type)) return 'B';
  }

  // Infer from description
  const desc = (charge.description || '').toLowerCase();

  const isRoom = desc.includes('room') || desc.includes('tariff') || desc.includes('accommodation') || desc.includes('lodging') || desc.includes('rate');
  if (isRoom) {
    return profile.primaryTypes?.includes('Room') ? 'A' : 'B';
  }

  if (desc.includes('conference') || desc.includes('facilities') || desc.includes('hall') || desc.includes('venue') || desc.includes('event')) {
    return profile.primaryTypes?.includes('Extra') || profile.primaryTypes?.includes('Room') ? 'A' : 'B';
  }

  if (desc.includes('restaurant') || desc.includes('dinner') || desc.includes('breakfast') || desc.includes('bar') || desc.includes('cafe') || desc.includes('food') || desc.includes('beverage')) {
    return profile.primaryTypes?.includes('F&B') ? 'A' : 'B';
  }

  if (desc.includes('minibar') || desc.includes('fridge') || desc.includes('drink')) {
    return profile.primaryTypes?.includes('Minibar') ? 'A' : 'B';
  }

  if (desc.includes('spa') || desc.includes('massage') || desc.includes('wellness') || desc.includes('treatment')) {
    return profile.primaryTypes?.includes('Spa') || profile.primaryTypes?.includes('Extra') ? 'A' : 'B';
  }

  if (desc.includes('laundry') || desc.includes('dry clean') || desc.includes('washing')) {
    return profile.primaryTypes?.includes('Laundry') ? 'A' : 'B';
  }

  if (desc.includes('transfer') || desc.includes('airport') || desc.includes('shuttle') || desc.includes('taxi')) {
    return profile.primaryTypes?.includes('Transfer') ? 'A' : 'B';
  }

  // Default to B
  return 'B';
}

/**
 * Infers charge type from charge description when type is not explicitly set.
 */
export function getChargeType(charge: { type?: string; description?: string }): 'Room' | 'F&B' | 'Laundry' | 'Transfer' | 'Extra' {
  if (charge.type) {
    if (['Room', 'F&B', 'Laundry', 'Transfer', 'Extra'].includes(charge.type)) {
      return charge.type as 'Room' | 'F&B' | 'Laundry' | 'Transfer' | 'Extra';
    }
  }

  const desc = (charge.description || '').toLowerCase();

  if (desc.includes('room') || desc.includes('tariff') || desc.includes('accommodation') || desc.includes('lodging') || desc.includes('rate')) {
    return 'Room';
  }

  if (desc.includes('restaurant') || desc.includes('dinner') || desc.includes('breakfast') || desc.includes('bar') || desc.includes('cafe') || desc.includes('food') || desc.includes('beverage')) {
    return 'F&B';
  }

  if (desc.includes('laundry') || desc.includes('dry clean') || desc.includes('washing')) {
    return 'Laundry';
  }

  if (desc.includes('transfer') || desc.includes('airport') || desc.includes('shuttle') || desc.includes('taxi')) {
    return 'Transfer';
  }

  return 'Extra';
}
