/**
 * Menu Enhancements Service
 * Phase 4 Item 3: Modifier groups, allergens, nutrition, time-based pricing
 */

export interface ModifierGroup {
  id: string;
  outlet_id: string | null;
  name: string;
  description?: string;
  selection_type: 'single' | 'multi' | 'quantity';
  min_selections: number;
  max_selections: number | null;
  is_required: boolean;
  sort_order: number;
  is_active: boolean;
  options?: ModifierOption[];
}

export interface ModifierOption {
  id: string;
  modifier_group_id: string;
  name: string;
  price_adjustment: number;
  is_default: boolean;
  sort_order: number;
  is_active: boolean;
}

export interface Allergen {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  is_active: boolean;
}

export interface NutritionInfo {
  menu_item_id: string;
  serving_size?: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  cholesterol_mg?: number;
  saturated_fat_g?: number;
  trans_fat_g?: number;
  vitamins?: Record<string, any>;
  minerals?: Record<string, any>;
}

export interface TimeBasedPricingRule {
  id: string;
  outlet_id: string | null;
  name: string;
  description?: string;
  rule_type: 'happy_hour' | 'lunch_special' | 'dinner_premium' | 'late_night' | 'breakfast' | 'custom';
  start_time: string;
  end_time: string;
  applicable_days: number[];
  pricing_type: 'percentage_off' | 'fixed_price' | 'percentage_premium' | 'fixed_off';
  pricing_value: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
}

export interface TimeBasedPriceResult {
  success: boolean;
  price: number;
  original_price: number;
  rule_applied: string | null;
  rule_type?: string;
  error?: string;
}

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api/fb/menu-enhancements${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed: ${res.status}`);
  return data as T;
}

// ── Modifier Groups ──────────────────────────────────────────────────────
export async function fetchModifierGroups(outletId?: string): Promise<ModifierGroup[]> {
  const qs = outletId ? `?outlet_id=${outletId}` : '';
  return apiRequest<ModifierGroup[]>(`/modifier-groups${qs}`);
}

export async function createModifierGroup(data: Omit<ModifierGroup, 'id' | 'options'>): Promise<ModifierGroup> {
  return apiRequest<ModifierGroup>('/modifier-groups', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateModifierGroup(id: string, data: Partial<ModifierGroup>): Promise<ModifierGroup> {
  return apiRequest<ModifierGroup>(`/modifier-groups/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteModifierGroup(id: string): Promise<void> {
  await apiRequest(`/modifier-groups/${id}`, { method: 'DELETE' });
}

// ── Modifier Options ─────────────────────────────────────────────────────
export async function createModifierOption(data: Omit<ModifierOption, 'id'>): Promise<ModifierOption> {
  return apiRequest<ModifierOption>('/modifier-options', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateModifierOption(id: string, data: Partial<ModifierOption>): Promise<ModifierOption> {
  return apiRequest<ModifierOption>(`/modifier-options/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteModifierOption(id: string): Promise<void> {
  await apiRequest(`/modifier-options/${id}`, { method: 'DELETE' });
}

// ── Menu Item Modifiers ──────────────────────────────────────────────────
export async function linkMenuItemModifier(menuItemId: string, modifierGroupId: string, sortOrder?: number): Promise<void> {
  await apiRequest('/menu-item-modifiers', { method: 'POST', body: JSON.stringify({ menu_item_id: menuItemId, modifier_group_id: modifierGroupId, sort_order: sortOrder || 0 }) });
}

export async function unlinkMenuItemModifier(menuItemId: string, modifierGroupId: string): Promise<void> {
  await apiRequest(`/menu-item-modifiers/${menuItemId}/${modifierGroupId}`, { method: 'DELETE' });
}

// ── Allergens ────────────────────────────────────────────────────────────
export async function fetchAllergens(): Promise<Allergen[]> {
  return apiRequest<Allergen[]>('/allergens');
}

export async function fetchMenuItemAllergens(menuItemId: string): Promise<any[]> {
  return apiRequest<any[]>(`/menu-items/${menuItemId}/allergens`);
}

export async function setMenuItemAllergens(menuItemId: string, allergens: Array<{ allergen_id: string; contains: boolean; may_contain: boolean }>): Promise<void> {
  await apiRequest(`/menu-items/${menuItemId}/allergens`, { method: 'PUT', body: JSON.stringify({ allergens }) });
}

// ── Nutrition ────────────────────────────────────────────────────────────
export async function fetchNutrition(menuItemId: string): Promise<NutritionInfo | null> {
  return apiRequest<NutritionInfo | null>(`/menu-items/${menuItemId}/nutrition`);
}

export async function upsertNutrition(menuItemId: string, data: Omit<NutritionInfo, 'menu_item_id'>): Promise<NutritionInfo> {
  return apiRequest<NutritionInfo>(`/menu-items/${menuItemId}/nutrition`, { method: 'PUT', body: JSON.stringify(data) });
}

// ── Time-Based Pricing ───────────────────────────────────────────────────
export async function fetchPricingRules(outletId?: string): Promise<TimeBasedPricingRule[]> {
  const qs = outletId ? `?outlet_id=${outletId}` : '';
  return apiRequest<TimeBasedPricingRule[]>(`/pricing-rules${qs}`);
}

export async function createPricingRule(data: Omit<TimeBasedPricingRule, 'id'>): Promise<TimeBasedPricingRule> {
  return apiRequest<TimeBasedPricingRule>('/pricing-rules', { method: 'POST', body: JSON.stringify(data) });
}

export async function updatePricingRule(id: string, data: Partial<TimeBasedPricingRule>): Promise<TimeBasedPricingRule> {
  return apiRequest<TimeBasedPricingRule>(`/pricing-rules/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deletePricingRule(id: string): Promise<void> {
  await apiRequest(`/pricing-rules/${id}`, { method: 'DELETE' });
}

export async function resolveTimeBasedPrice(menuItemId: string, outletId: string): Promise<TimeBasedPriceResult> {
  return apiRequest<TimeBasedPriceResult>(`/resolve-price/${menuItemId}?outlet_id=${outletId}`);
}

export async function linkPricingRuleMenuItems(ruleId: string, menuItemIds: string[]): Promise<void> {
  await apiRequest('/pricing-rules/menu-items', { method: 'POST', body: JSON.stringify({ rule_id: ruleId, menu_item_ids: menuItemIds }) });
}
