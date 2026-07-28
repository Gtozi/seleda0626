import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { validatePassword } from '../../lib/passwordPolicy';
import { enrichUserWithDerivedPermissions, fetchPasswordPolicy, writeAuditEvent, mapSystemUserFromDb } from '../services/sharedServices';
import { userApiSchema, roleApiSchema } from '../../schemas/userSchema';

const router = Router();

// ── Users ──────────────────────────────────────────────────────

router.get('/users', authenticate, requirePermission('users:manage'), async (req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from('system_users').select('*').order('name');
    if (error) return res.status(500).json({ error: error.message });
    const mapped = (data || []).map(mapSystemUserFromDb);
    const enriched = await Promise.all(mapped.map(u => enrichUserWithDerivedPermissions(u)));
    return res.json({ users: enriched });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.post('/users', authenticate, requirePermission('users:manage'), async (req, res) => {
  const validation = userApiSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  const body = validation.data;
  if (body.password) {
    const policy = await fetchPasswordPolicy();
    const passwordValidation = validatePassword(body.password, policy);
    if (!passwordValidation.valid) return res.status(400).json({ error: passwordValidation.errors.join('; ') });
  }
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const newId = body.id || `U-${Date.now()}`;
    const password = body.password || 'ChangeMe123!';
    const newHash = await bcrypt.hash(password, 10);

    // 1. Create auth user via Supabase Auth Admin API (proper password hashing for GoTrue)
    let authUserId: string | null = null;
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: String(body.email).toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { name: body.full_name, role: body.role },
    });

    if (authError) {
      // If user already exists, try to find them
      if (authError.message.includes('already') || authError.message.includes('registered')) {
        const { data: existingAuth } = await supabaseAdmin
          .from('auth.users')
          .select('id')
          .eq('email', String(body.email).toLowerCase())
          .maybeSingle();
        authUserId = existingAuth?.id || null;
      } else {
        return res.status(400).json({ error: `Auth user creation failed: ${authError.message}` });
      }
    } else {
      authUserId = authData.user.id;
    }

    // 2. Create system_users record with additional fields
    let customRoleId = body.custom_role_id || null;
    let roleDesc = body.role;
    if (customRoleId) {
      try {
        const { data: roleData } = await supabaseAdmin.from('roles')
          .select('display_name, role_label, name')
          .eq('id', customRoleId)
          .maybeSingle();
        if (roleData) roleDesc = roleData.role_label || roleData.display_name || roleData.name;
      } catch (e) { console.error('Failed to fetch custom role:', e); }
    }
    const { data, error } = await supabaseAdmin.from('system_users').upsert({
      id: newId,
      name: body.full_name,
      email: String(body.email).toLowerCase(),
      role: body.role,
      role_description: roleDesc,
      avatar_initials: body.full_name?.slice(0, 2).toUpperCase() || 'U',
      status: body.is_active ? 'Active' : 'Inactive',
      linked_employee_id: null,
      username: body.username || null,
      mobile_number: null,
      department: body.department || null,
      custom_role_id: customRoleId,
      security_settings: {},
      data_restrictions: {},
      allowed_tabs: body.allowed_tabs || [],
      allowed_settings: body.allowed_settings || {},
      permission_matrix: {},
      password_hash: newHash,
      force_password_change: true,
      auth_user_id: authUserId,
    }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    await writeAuditEvent({ req, user: req.user!, action: 'user.created', entityType: 'User', entityId: newId, module: 'admin', details: { name: body.full_name, email: body.email, role: body.role } });
    return res.json({ success: true, user: mapSystemUserFromDb(data) });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.patch('/users/:id', authenticate, requirePermission('users:manage'), async (req, res) => {
  const targetId = req.params.id;
  const partialUserSchema = userApiSchema.partial();
  const validation = partialUserSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  const updates = validation.data;

  if (req.user!.id === targetId) {
    const privilegedFields: (keyof typeof updates)[] = ['role', 'custom_role_id', 'allowed_tabs', 'allowed_settings'];
    const attemptedPrivilegeChange = privilegedFields.some(f => updates[f] !== undefined);
    if (attemptedPrivilegeChange) {
      await writeAuditEvent({
        req, user: req.user!, action: 'privilege.escalation_blocked',
        entityType: 'User', entityId: targetId, module: 'security', outcome: 'denied',
        details: { attemptedFields: privilegedFields.filter(f => updates[f] !== undefined) }
      });
      for (const f of privilegedFields) delete updates[f];
    }
  }
  if (updates.password) {
    const policy = await fetchPasswordPolicy();
    const validation = validatePassword(updates.password, policy);
    if (!validation.valid) return res.status(400).json({ error: validation.errors.join('; ') });
  }
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const payload: any = {};
    if (updates.full_name !== undefined) payload.name = updates.full_name;
    if (updates.email !== undefined) payload.email = String(updates.email).toLowerCase();
    if (updates.role !== undefined) {
      payload.role = updates.role;
      payload.role_description = updates.role;
    }
    if (updates.custom_role_id !== undefined) {
      payload.custom_role_id = updates.custom_role_id || null;
      // If a custom role is assigned, use its display name as role_description
      if (updates.custom_role_id) {
        try {
          const { data: roleData } = await supabaseAdmin.from('roles')
            .select('display_name, role_label, name')
            .eq('id', updates.custom_role_id)
            .maybeSingle();
          if (roleData) {
            payload.role_description = roleData.role_label || roleData.display_name || roleData.name;
          }
        } catch (e) {
          console.error('Failed to fetch custom role for role_description:', e);
        }
      }
    }
    if (updates.is_active !== undefined) payload.status = updates.is_active ? 'Active' : 'Inactive';
    if (updates.username !== undefined) payload.username = updates.username || null;
    if (updates.department !== undefined) payload.department = updates.department || null;
    if (updates.allowed_tabs !== undefined) payload.allowed_tabs = updates.allowed_tabs;
    if (updates.allowed_settings !== undefined) payload.allowed_settings = updates.allowed_settings;
    if (updates.password) {
      payload.password_hash = await bcrypt.hash(updates.password, 10);
      payload.force_password_change = false;
      payload.password_updated_at = new Date().toISOString();
    }
    const { data, error } = await supabaseAdmin.from('system_users').update(payload).eq('id', targetId).select().single();
    if (error) return res.status(500).json({ error: error.message });

    // Sync password to auth.users via Supabase Auth Admin API so POS login works
    if (updates.password && data?.auth_user_id) {
      const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
        data.auth_user_id,
        { password: updates.password }
      );
      if (authUpdateError) console.error('Failed to sync password to auth.users:', authUpdateError.message);
    }

    await writeAuditEvent({ req, user: req.user!, action: 'user.updated', entityType: 'User', entityId: targetId, module: 'admin', details: { updates: Object.keys(updates) } });
    return res.json({ success: true, user: mapSystemUserFromDb(data) });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.delete('/users/:id', authenticate, requirePermission('users:manage'), async (req, res) => {
  const targetId = req.params.id;
  if (req.user!.id === targetId) return res.status(403).json({ error: 'You cannot delete your own account' });
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { error } = await supabaseAdmin.from('system_users').delete().eq('id', targetId);
    if (error) return res.status(500).json({ error: error.message });
    await writeAuditEvent({ req, user: req.user!, action: 'user.deleted', entityType: 'User', entityId: targetId, module: 'admin' });
    return res.json({ success: true });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.post('/users/:id/unlock', authenticate, requirePermission('users:manage'), async (req, res) => {
  const targetId = req.params.id;
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { error } = await supabaseAdmin.from('system_users')
      .update({ failed_login_count: 0, locked_until: null, mfa_locked_until: null, failed_mfa_count: 0, status: 'Active' })
      .eq('id', targetId);
    if (error) return res.status(500).json({ error: error.message });
    await writeAuditEvent({ req, user: req.user!, action: 'user.unlocked', entityType: 'User', entityId: targetId, module: 'admin' });
    return res.json({ success: true });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

// ── Roles ──────────────────────────────────────────────────────

router.get('/roles', authenticate, requirePermission('roles:manage'), async (req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('roles')
      .select(`id, name, display_name, description, is_superuser, is_system, is_active, category, department, role_label, parent_role_id, module_access, permissions, role_permissions ( permissions ( code ) )`)
      .order('name');
    if (error) return res.status(500).json({ error: error.message });

    const roles = (data || []).map((r: any) => ({
      id: r.id, name: r.name, display_name: r.display_name || r.name,
      description: r.description || '',
      isSystem: r.is_system || false, isSuperuser: r.is_superuser || false,
      isActive: r.is_active !== false, category: r.category || 'custom',
      department: r.department || null, role_label: r.role_label || null,
      parent_role_id: r.parent_role_id || null,
      module_access: r.module_access || {}, permissions: r.permissions || {},
      rbacPermissions: (r.role_permissions || []).map((rp: any) => {
        const perm = Array.isArray(rp.permissions) ? rp.permissions[0] : rp.permissions;
        return perm?.code || '';
      }).filter(Boolean),
      source: r.is_system ? 'server' : 'custom'
    }));
    console.log(`GET /roles: returning ${roles.length} roles`);
    return res.json({ roles });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.post('/roles', authenticate, requirePermission('roles:manage'), async (req, res) => {
  const validation = roleApiSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  const body = validation.data;
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const roleId = body.id || `ROLE-${Date.now()}`;
    const { data, error } = await supabaseAdmin.from('roles').upsert({
      id: roleId,
      name: body.name,
      display_name: body.name,
      description: body.description || '',
      department: req.body.department || null,
      role_label: req.body.roleLabel || null,
      parent_role_id: req.body.parentRoleId || null,
      category: req.body.category || 'custom',
      module_access: req.body.moduleAccess || {},
      permissions: req.body.permissions || {},
      is_system: false,
      is_superuser: false,
      is_active: body.is_active !== false
    }, { onConflict: 'id' }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    // Sync permissions to role_permissions table
    try {
      let permCodes: string[];
      if (req.body.rbacPermissionCodes !== undefined) {
        permCodes = req.body.rbacPermissionCodes;
      } else {
        const permObj = req.body.permissions || {};
        permCodes = Array.isArray(permObj) ? permObj : Object.values(permObj).flat();
      }
      await syncRolePermissions(data.id, permCodes, supabaseAdmin);
    } catch (syncErr) { console.error('Role permission sync error:', syncErr); }
    const isNew = body.id ? false : true;
    await writeAuditEvent({ req, user: req.user!, action: isNew ? 'role.created' : 'role.updated', entityType: 'CustomRole', entityId: data.id, module: 'admin', details: { name: body.name, department: req.body.department } });
    return res.json({ success: true, role: data });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.patch('/roles/:id', authenticate, requirePermission('roles:manage'), async (req, res) => {
  const roleId = req.params.id;
  const partialRoleSchema = roleApiSchema.partial();
  const validation = partialRoleSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  const updates = validation.data;
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.name !== undefined) payload.display_name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (req.body.department !== undefined) payload.department = req.body.department || null;
    if (req.body.roleLabel !== undefined) payload.role_label = req.body.roleLabel || null;
    if (req.body.parentRoleId !== undefined) payload.parent_role_id = req.body.parentRoleId || null;
    if (req.body.category !== undefined) payload.category = req.body.category;
    if (req.body.moduleAccess !== undefined) payload.module_access = req.body.moduleAccess;
    if (req.body.permissions !== undefined) payload.permissions = req.body.permissions;
    if (updates.is_superuser !== undefined) payload.is_superuser = updates.is_superuser;
    if (updates.is_active !== undefined) payload.is_active = updates.is_active;
    const { data, error } = await supabaseAdmin.from('roles').update(payload).eq('id', roleId).select().single();
    if (error) return res.status(500).json({ error: error.message });
    // Sync permissions to role_permissions
    if (req.body.rbacPermissionCodes !== undefined || req.body.permissions !== undefined) {
      try {
        let permCodes: string[];
        if (req.body.rbacPermissionCodes !== undefined) {
          permCodes = req.body.rbacPermissionCodes;
        } else {
          const permObj = req.body.permissions || {};
          permCodes = Array.isArray(permObj) ? permObj : Object.values(permObj).flat();
        }
        await syncRolePermissions(roleId, permCodes, supabaseAdmin);
      } catch (syncErr) { console.error('Role permission sync error:', syncErr); }
    }
    await writeAuditEvent({ req, user: req.user!, action: 'role.updated', entityType: 'Role', entityId: roleId, module: 'admin', details: { updates: Object.keys(payload) } });
    return res.json({ success: true, role: data });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.delete('/roles/:id', authenticate, requirePermission('roles:manage'), async (req, res) => {
  const roleId = req.params.id;
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    // Also delete role_permissions for this role
    await supabaseAdmin.from('role_permissions').delete().eq('role_id', roleId);
    const { error } = await supabaseAdmin.from('roles').delete().eq('id', roleId);
    if (error) return res.status(500).json({ error: error.message });
    await writeAuditEvent({ req, user: req.user!, action: 'role.deleted', entityType: 'Role', entityId: roleId, module: 'admin' });
    return res.json({ success: true });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

// ── Permissions ──────────────────────────────────────────────

router.get('/permissions', authenticate, requirePermission('roles:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { data, error } = await supabaseAdmin.from('permissions').select('id, code, module, description').order('module').order('code');
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ permissions: data || [] });
});

// Sync custom role permissions to the roles/role_permissions tables for RBAC
async function syncRolePermissions(roleId: string, permissionCodes: string[], supabaseAdmin: any) {
  // Always delete existing role_permissions first, even if new list is empty
  await supabaseAdmin.from('role_permissions').delete().eq('role_id', roleId);
  if (!permissionCodes || permissionCodes.length === 0) return;
  // Find permission IDs by code
  const { data: perms, error: permError } = await supabaseAdmin
    .from('permissions')
    .select('id, code')
    .in('code', permissionCodes);
  if (permError || !perms) return;
  // Insert new role_permissions
  const rpRows = perms.map((p: any) => ({ role_id: roleId, permission_id: p.id }));
  if (rpRows.length > 0) {
    await supabaseAdmin.from('role_permissions').insert(rpRows);
  }
}

// ── Module Registry (dynamic modules & permission categories) ──

// GET /api/admin/module-registry — returns all active modules, permission categories, department mappings
router.get('/module-registry', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  try {
    const { data, error } = await supabaseAdmin.rpc('get_module_registry');
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || {});
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/modules — list all modules (including inactive)
router.get('/modules', authenticate, requirePermission('roles:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { data, error } = await supabaseAdmin.from('modules').select('*').order('department').order('sort_order');
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ modules: data || [] });
});

// POST /api/admin/modules — register a new module
router.post('/modules', authenticate, requirePermission('roles:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id, department, label, icon, description, sortOrder } = req.body;
  if (!id || !label) return res.status(400).json({ error: 'id and label are required' });
  const { data, error } = await supabaseAdmin.from('modules').upsert({
    id, department: department || 'general', label, icon: icon || '📦',
    description: description || '', sort_order: sortOrder || 0, is_active: true,
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'module.created', entityType: 'Module', entityId: id, module: 'admin', details: { label, department } });
  return res.json({ module: data });
});

// PATCH /api/admin/modules/:id — update a module (including deactivating)
router.patch('/modules/:id', authenticate, requirePermission('roles:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { label, icon, description, department, sortOrder, isActive } = req.body;
  const updates: any = { updated_at: new Date().toISOString() };
  if (label !== undefined) updates.label = label;
  if (icon !== undefined) updates.icon = icon;
  if (description !== undefined) updates.description = description;
  if (department !== undefined) updates.department = department;
  if (sortOrder !== undefined) updates.sort_order = sortOrder;
  if (isActive !== undefined) updates.is_active = isActive;
  const { data, error } = await supabaseAdmin.from('modules').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'module.updated', entityType: 'Module', entityId: req.params.id, module: 'admin', details: updates });
  return res.json({ module: data });
});

// DELETE /api/admin/modules/:id — delete a module (triggers auto-cleanup of module_access)
router.delete('/modules/:id', authenticate, requirePermission('roles:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { error } = await supabaseAdmin.from('modules').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'module.deleted', entityType: 'Module', entityId: req.params.id, module: 'admin' });
  return res.json({ success: true });
});

// GET /api/admin/permission-categories — list all permission categories
router.get('/permission-categories', authenticate, requirePermission('roles:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { data, error } = await supabaseAdmin.from('permission_categories').select('*').order('sort_order');
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ categories: data || [] });
});

// POST /api/admin/permission-categories — create a new permission category
router.post('/permission-categories', authenticate, requirePermission('roles:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id, label, icon, actions, sortOrder } = req.body;
  if (!id || !label) return res.status(400).json({ error: 'id and label are required' });
  const { data, error } = await supabaseAdmin.from('permission_categories').upsert({
    id, label, icon: icon || '📋', actions: actions || [], sort_order: sortOrder || 0,
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'perm_category.created', entityType: 'PermissionCategory', entityId: id, module: 'admin', details: { label } });
  return res.json({ category: data });
});

// PATCH /api/admin/permission-categories/:id — update a permission category
router.patch('/permission-categories/:id', authenticate, requirePermission('roles:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { label, icon, actions, sortOrder } = req.body;
  const updates: any = { updated_at: new Date().toISOString() };
  if (label !== undefined) updates.label = label;
  if (icon !== undefined) updates.icon = icon;
  if (actions !== undefined) updates.actions = actions;
  if (sortOrder !== undefined) updates.sort_order = sortOrder;
  const { data, error } = await supabaseAdmin.from('permission_categories').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'perm_category.updated', entityType: 'PermissionCategory', entityId: req.params.id, module: 'admin', details: updates });
  return res.json({ category: data });
});

// DELETE /api/admin/permission-categories/:id — delete (triggers auto-cleanup of permissions JSONB)
router.delete('/permission-categories/:id', authenticate, requirePermission('roles:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { error } = await supabaseAdmin.from('permission_categories').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'perm_category.deleted', entityType: 'PermissionCategory', entityId: req.params.id, module: 'admin' });
  return res.json({ success: true });
});

// POST /api/admin/department-permission-categories — map a department to a permission category
router.post('/department-permission-categories', authenticate, requirePermission('roles:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { department, categoryId, sortOrder } = req.body;
  if (!department || !categoryId) return res.status(400).json({ error: 'department and categoryId are required' });
  const { data, error } = await supabaseAdmin.from('department_permission_categories').upsert({
    department, category_id: categoryId, sort_order: sortOrder || 0,
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ mapping: data });
});

// DELETE /api/admin/department-permission-categories — unmap a department from a permission category
router.delete('/department-permission-categories', authenticate, requirePermission('roles:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { department, categoryId } = req.body;
  if (!department || !categoryId) return res.status(400).json({ error: 'department and categoryId are required' });
  const { error } = await supabaseAdmin.from('department_permission_categories')
    .delete().eq('department', department).eq('category_id', categoryId);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
});

// ── Organizations ──────────────────────────────────────────────

router.get('/organizations', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { data, error } = await supabaseAdmin.from('organizations').select('*').order('name');
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ organizations: data || [] });
});

router.post('/organizations', authenticate, requirePermission('settings:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { name, legalName, taxId, address, phone, email } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const { data, error } = await supabaseAdmin.from('organizations').insert({
    name, legal_name: legalName || null, tax_id: taxId || null,
    address: address || null, phone: phone || null, email: email || null,
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'org.created', entityType: 'Organization', entityId: data.id, module: 'admin' });
  return res.json({ organization: data });
});

router.patch('/organizations/:id', authenticate, requirePermission('settings:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { name, legalName, taxId, address, phone, email } = req.body;
  const updates: any = {};
  if (name !== undefined) updates.name = name;
  if (legalName !== undefined) updates.legal_name = legalName;
  if (taxId !== undefined) updates.tax_id = taxId;
  if (address !== undefined) updates.address = address;
  if (phone !== undefined) updates.phone = phone;
  if (email !== undefined) updates.email = email;
  const { data, error } = await supabaseAdmin.from('organizations').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'org.updated', entityType: 'Organization', entityId: req.params.id, module: 'admin' });
  return res.json({ organization: data });
});

// ── Properties ─────────────────────────────────────────────────

router.get('/properties', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { data, error } = await supabaseAdmin.from('properties').select('*, organizations(*)').order('name');
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ properties: data || [] });
});

router.post('/properties', authenticate, requirePermission('settings:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { orgId, name, code, address, phone, email, currency, fiscalYearStart, isActive } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const { data, error } = await supabaseAdmin.from('properties').insert({
    org_id: orgId || null, name, code: code || null,
    address: address || null, phone: phone || null, email: email || null,
    currency: currency || 'ETB', fiscal_year_start: fiscalYearStart || null,
    is_active: isActive ?? true,
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'property.created', entityType: 'Property', entityId: data.id, module: 'admin' });
  return res.json({ property: data });
});

router.patch('/properties/:id', authenticate, requirePermission('settings:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { orgId, name, code, address, phone, email, currency, fiscalYearStart, isActive } = req.body;
  const updates: any = {};
  if (orgId !== undefined) updates.org_id = orgId;
  if (name !== undefined) updates.name = name;
  if (code !== undefined) updates.code = code;
  if (address !== undefined) updates.address = address;
  if (phone !== undefined) updates.phone = phone;
  if (email !== undefined) updates.email = email;
  if (currency !== undefined) updates.currency = currency;
  if (fiscalYearStart !== undefined) updates.fiscal_year_start = fiscalYearStart;
  if (isActive !== undefined) updates.is_active = isActive;
  const { data, error } = await supabaseAdmin.from('properties').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'property.updated', entityType: 'Property', entityId: req.params.id, module: 'admin' });
  return res.json({ property: data });
});

// ── Scheduler ──────────────────────────────────────────────────

router.get('/scheduler/jobs', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { data, error } = await supabaseAdmin.from('scheduled_jobs').select('*').order('name');
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ jobs: data || [] });
});

router.patch('/scheduler/jobs/:id', authenticate, requirePermission('settings:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { name, scheduleCron, config, enabled } = req.body;
  const updates: any = {};
  if (name !== undefined) updates.name = name;
  if (scheduleCron !== undefined) updates.schedule_cron = scheduleCron;
  if (config !== undefined) updates.config = config;
  if (enabled !== undefined) updates.enabled = enabled;
  const { data, error } = await supabaseAdmin.from('scheduled_jobs').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'job.updated', entityType: 'ScheduledJob', entityId: req.params.id, module: 'admin' });
  return res.json({ job: data });
});

router.post('/scheduler/jobs/:id/trigger', authenticate, requirePermission('settings:manage'), async (req, res) => {
  try {
    const { triggerJobManually } = require('../scheduler');
    const result = await triggerJobManually(req.params.id);
    await writeAuditEvent({ req, user: req.user!, action: 'job.triggered', entityType: 'ScheduledJob', entityId: req.params.id, module: 'admin' });
    return res.json(result);
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
});

router.get('/scheduler/jobs/:id/runs', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { data, error } = await supabaseAdmin.from('job_runs').select('*').eq('job_id', req.params.id).order('created_at', { ascending: false }).limit(50);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ runs: data || [] });
});

// ── Compliance Center ──────────────────────────────────────────

router.get('/compliance/consent-logs', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { data, error } = await supabaseAdmin.from('consent_logs').select('*').order('timestamp', { ascending: false }).limit(100);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ logs: data || [] });
});

router.get('/compliance/retention-policies', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { data, error } = await supabaseAdmin.from('data_retention_policies').select('*').order('table_name');
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ policies: data || [] });
});

router.patch('/compliance/retention-policies/:id', authenticate, requirePermission('settings:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { retentionDays, action, enabled } = req.body;
  const updates: any = {};
  if (retentionDays !== undefined) updates.retention_days = retentionDays;
  if (action !== undefined) updates.action = action;
  if (enabled !== undefined) updates.enabled = enabled;
  const { data, error } = await supabaseAdmin.from('data_retention_policies').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ policy: data });
});

router.post('/compliance/pii-export', authenticate, requirePermission('settings:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { targetEntity } = req.body;
  if (!targetEntity) return res.status(400).json({ error: 'targetEntity is required' });

  const [guests, reservations, folios, folioLines] = await Promise.all([
    supabaseAdmin.from('guests').select('*').eq('id', targetEntity).single(),
    supabaseAdmin.from('reservations').select('*').eq('guest_id', targetEntity),
    supabaseAdmin.from('folios').select('*').eq('owner_id', targetEntity),
    supabaseAdmin.from('folio_lines').select('*').eq('reservation_id', targetEntity),
  ]);

  const exportData = {
    guest: guests.data,
    reservations: reservations.data,
    folios: folios.data,
    folioLines: folioLines.data,
    exportedAt: new Date().toISOString(),
  };

  await supabaseAdmin.from('pii_export_requests').insert({
    requested_by: req.user?.id || null,
    target_entity: targetEntity,
    status: 'completed',
    exported_at: new Date().toISOString(),
  });

  await writeAuditEvent({ req, user: req.user!, action: 'pii.exported', entityType: 'Guest', entityId: targetEntity, module: 'compliance' });
  return res.json({ success: true, data: exportData });
});

router.post('/compliance/pii-erasure', authenticate, requirePermission('settings:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { targetEntity } = req.body;
  if (!targetEntity) return res.status(400).json({ error: 'targetEntity is required' });

  // Anonymize PII fields in guests table (keep financial records for legal)
  const { error: guestError } = await supabaseAdmin.from('guests').update({
    first_name: '[ANONYMIZED]',
    last_name: '[ANONYMIZED]',
    email: null,
    phone: null,
    address: null,
    passport_number: null,
    nationality: null,
  }).eq('id', targetEntity);

  if (guestError) return res.status(500).json({ error: guestError.message });

  await supabaseAdmin.from('pii_erasure_requests').insert({
    requested_by: req.user?.id || null,
    target_entity: targetEntity,
    status: 'completed',
    erased_at: new Date().toISOString(),
  });

  await writeAuditEvent({ req, user: req.user!, action: 'pii.erased', entityType: 'Guest', entityId: targetEntity, module: 'compliance' });
  return res.json({ success: true });
});

router.get('/compliance/requests', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const [exports, erasures] = await Promise.all([
    supabaseAdmin.from('pii_export_requests').select('*').order('created_at', { ascending: false }).limit(50),
    supabaseAdmin.from('pii_erasure_requests').select('*').order('created_at', { ascending: false }).limit(50),
  ]);
  return res.json({ exports: exports.data || [], erasures: erasures.data || [] });
});

// ── Health Monitoring ──────────────────────────────────────────

router.get('/health/error-logs', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const level = req.query.level as string || 'all';
  let query = supabaseAdmin.from('error_logs').select('*').order('timestamp', { ascending: false }).limit(100);
  if (level !== 'all') query = query.eq('level', level);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ logs: data || [] });
});

router.get('/health/db-stats', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { data: tableSizes, error: tsError } = await supabaseAdmin.rpc('get_table_sizes');
  if (tsError) {
    // Fallback: just count key tables
    const tables = ['reservations', 'rooms', 'folios', 'folio_lines', 'guests', 'system_users', 'audit_events'];
    const counts: any = {};
    for (const t of tables) {
      const { count } = await supabaseAdmin.from(t).select('*', { count: 'exact', head: true });
      counts[t] = count || 0;
    }
    return res.json({ tableCounts: counts });
  }
  return res.json({ tableSizes: tableSizes || [] });
});

router.get('/health/job-failures', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { data, error } = await supabaseAdmin.from('job_runs').select('*, scheduled_jobs(name)').eq('status', 'failed').order('created_at', { ascending: false }).limit(20);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ failedJobs: data || [] });
});

// ── Config Versioning ──────────────────────────────────────────

router.get('/config-versions', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const configKey = req.query.config_key as string;
  const limit = parseInt(req.query.limit as string) || 50;
  
  if (configKey) {
    const { data, error } = await supabaseAdmin.rpc('get_config_history', {
      p_config_key: configKey,
      p_limit: limit
    });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ versions: data || [] });
  }
  
  // Return all config keys if no specific key provided
  const { data, error } = await supabaseAdmin
    .from('config_versions')
    .select('config_key, config_type, version, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) return res.status(500).json({ error: error.message });
  
  // Group by config_key and get latest version
  const configMap = new Map();
  (data || []).forEach((v: any) => {
    if (!configMap.has(v.config_key) || v.version > configMap.get(v.config_key).version) {
      configMap.set(v.config_key, v);
    }
  });
  
  return res.json({ configs: Array.from(configMap.values()) });
});

router.post('/config-versions/create', authenticate, requirePermission('settings:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { configKey, configType, configData, changeReason } = req.body;
  if (!configKey || !configData) return res.status(400).json({ error: 'configKey and configData are required' });
  
  const { data, error } = await supabaseAdmin.rpc('create_config_version', {
    p_config_key: configKey,
    p_config_type: configType || 'manual',
    p_config_data: configData,
    p_changed_by: req.user?.id || null,
    p_change_reason: changeReason || null
  });
  if (error) return res.status(500).json({ error: error.message });
  
  await writeAuditEvent({ 
    req, 
    user: req.user!, 
    action: 'config.version_created', 
    entityType: 'ConfigVersion', 
    entityId: data, 
    module: 'admin',
    details: { configKey, configType } 
  });
  return res.json({ success: true, versionId: data });
});

router.post('/config-versions/rollback', authenticate, requirePermission('settings:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { configKey, targetVersion, changeReason } = req.body;
  if (!configKey || !targetVersion) return res.status(400).json({ error: 'configKey and targetVersion are required' });
  
  const { data, error } = await supabaseAdmin.rpc('rollback_config_version', {
    p_config_key: configKey,
    p_target_version: targetVersion,
    p_changed_by: req.user?.id || null,
    p_change_reason: changeReason || null
  });
  if (error) return res.status(500).json({ error: error.message });
  
  await writeAuditEvent({ 
    req, 
    user: req.user!, 
    action: 'config.rollback', 
    entityType: 'ConfigVersion', 
    entityId: configKey, 
    module: 'admin',
    details: { configKey, targetVersion } 
  });
  return res.json({ success: true, rolledBackData: data });
});

// ── System Health Monitoring ───────────────────────────────────

router.get('/health/status', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { data, error } = await supabaseAdmin.rpc('get_system_health');
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ healthStatus: data || [] });
});

router.post('/health/check', authenticate, requirePermission('settings:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { checkType, checkName, status, responseTimeMs, details } = req.body;
  if (!checkType || !checkName || !status) return res.status(400).json({ error: 'checkType, checkName, and status are required' });
  
  const { data, error } = await supabaseAdmin.rpc('record_health_check', {
    p_check_type: checkType,
    p_check_name: checkName,
    p_status: status,
    p_response_time_ms: responseTimeMs || null,
    p_details: details || null
  });
  if (error) return res.status(500).json({ error: error.message });
  
  return res.json({ success: true, checkId: data });
});

router.get('/health/alerts', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const acknowledged = req.query.acknowledged === 'true';
  const { data, error } = await supabaseAdmin
    .from('health_alerts')
    .select('*, health_alert_rules(*)')
    .eq('acknowledged', acknowledged)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ alerts: data || [] });
});

router.patch('/health/alerts/:id/acknowledge', authenticate, requirePermission('settings:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { error } = await supabaseAdmin
    .from('health_alerts')
    .update({ 
      acknowledged: true, 
      acknowledged_by: req.user?.id, 
      acknowledged_at: new Date().toISOString() 
    })
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
});

router.get('/health/alert-rules', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { data, error } = await supabaseAdmin
    .from('health_alert_rules')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ rules: data || [] });
});

router.post('/health/alert-rules', authenticate, requirePermission('settings:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { checkType, checkName, condition, thresholdValue, alertSeverity, notificationChannels } = req.body;
  if (!checkType || !checkName || !condition) return res.status(400).json({ error: 'checkType, checkName, and condition are required' });
  
  const { data, error } = await supabaseAdmin.from('health_alert_rules').insert({
    check_type: checkType,
    check_name: checkName,
    condition,
    threshold_value: thresholdValue || null,
    alert_severity: alertSeverity || 'warning',
    notification_channels: notificationChannels || [],
    is_active: true
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ rule: data });
});

router.patch('/health/alert-rules/:id', authenticate, requirePermission('settings:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { condition, thresholdValue, alertSeverity, notificationChannels, isActive } = req.body;
  const updates: any = {};
  if (condition !== undefined) updates.condition = condition;
  if (thresholdValue !== undefined) updates.threshold_value = thresholdValue;
  if (alertSeverity !== undefined) updates.alert_severity = alertSeverity;
  if (notificationChannels !== undefined) updates.notification_channels = notificationChannels;
  if (isActive !== undefined) updates.is_active = isActive;
  updates.updated_at = new Date().toISOString();
  
  const { data, error } = await supabaseAdmin
    .from('health_alert_rules')
    .update(updates)
    .eq('id', req.params.id)
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ rule: data });
});

// ── Enhanced User Management (New System) ────────────────────────

router.post('/users/create', authenticate, requirePermission('users:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  
  const { email, password, name, role, department, phone, forcePasswordChange, customRoleId } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password, and name are required' });
  }
  
  // Validate password policy
  const policy = await fetchPasswordPolicy();
  const passwordValidation = validatePassword(password, policy);
  if (!passwordValidation.valid) {
    return res.status(400).json({ error: passwordValidation.errors.join('; ') });
  }
  
  try {
    const { data, error } = await supabaseAdmin.rpc('create_system_user', {
      p_email: email.toLowerCase(),
      p_password: password,
      p_name: name,
      p_role: role || 'member',
      p_department: department || null,
      p_phone: phone || null,
      p_force_password_change: forcePasswordChange !== false
    });
    
    if (error) return res.status(500).json({ error: error.message });

    // If a custom role was selected, assign it and update role_description
    if (customRoleId && data?.system_user_id) {
      let roleDesc = role || 'member';
      try {
        const { data: roleData } = await supabaseAdmin.from('roles')
          .select('display_name, role_label, name')
          .eq('id', customRoleId)
          .maybeSingle();
        if (roleData) roleDesc = roleData.role_label || roleData.display_name || roleData.name;
      } catch (e) { console.error('Failed to fetch custom role:', e); }

      await supabaseAdmin.from('system_users')
        .update({ custom_role_id: customRoleId, role_description: roleDesc })
        .eq('id', data.system_user_id);

      try {
        await supabaseAdmin.from('user_roles')
          .upsert({ user_id: data.system_user_id, role_id: customRoleId });
      } catch (e) { console.error('Failed to assign user_roles:', e); }
    }
    
    await writeAuditEvent({ 
      req, 
      user: req.user!, 
      action: 'user.created', 
      entityType: 'User', 
      entityId: data?.system_user_id, 
      module: 'admin', 
      details: { name, email, role, customRoleId } 
    });
    
    return res.json({ success: true, user: data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ── Enhanced Role Management (New System) ────────────────────────

router.get('/custom-roles', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  
  const { data, error } = await supabaseAdmin
    .from('roles')
    .select('*')
    .eq('is_system', false)
    .order('name');
    
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ roles: data || [] });
});

router.post('/custom-roles', authenticate, requirePermission('roles:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  
  const { name, displayName, description, category, permissions, isSystemRole } = req.body;
  
  if (!name || !displayName) {
    return res.status(400).json({ error: 'name and displayName are required' });
  }
  
  try {
    const roleId = `ROLE-${Date.now()}`;
    const { data, error } = await supabaseAdmin.from('roles').insert({
      id: roleId,
      name,
      display_name: displayName,
      description: description || '',
      category: category || 'custom',
      permissions: permissions || {},
      is_system: false,
      is_superuser: false,
      is_active: true,
      created_by: req.user?.id || null
    }).select().single();
    
    if (error) return res.status(500).json({ error: error.message });
    
    // Sync permissions to role_permissions
    if (permissions) {
      const permCodes: string[] = Array.isArray(permissions) ? permissions : Object.values(permissions).flat();
      await syncRolePermissions(roleId, permCodes, supabaseAdmin);
    }
    
    await writeAuditEvent({ 
      req, 
      user: req.user!, 
      action: 'role.created', 
      entityType: 'Role', 
      entityId: roleId, 
      module: 'admin', 
      details: { name, displayName, category } 
    });
    
    return res.json({ success: true, roleId });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.patch('/custom-roles/:id', authenticate, requirePermission('roles:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  
  const roleId = req.params.id;
  const { displayName, description, category, permissions, isActive } = req.body;
  
  const updates: any = {};
  if (displayName !== undefined) updates.display_name = displayName;
  if (description !== undefined) updates.description = description;
  if (category !== undefined) updates.category = category;
  if (permissions !== undefined) updates.permissions = permissions;
  if (isActive !== undefined) updates.is_active = isActive;
  updates.updated_at = new Date().toISOString();
  
  const { data, error } = await supabaseAdmin
    .from('roles')
    .update(updates)
    .eq('id', roleId)
    .select()
    .single();
    
  if (error) return res.status(500).json({ error: error.message });
  
  await writeAuditEvent({ 
    req, 
    user: req.user!, 
    action: 'role.updated', 
    entityType: 'Role', 
    entityId: roleId, 
    module: 'admin', 
    details: { updates: Object.keys(updates) } 
  });
  
  return res.json({ success: true, role: data });
});

router.delete('/custom-roles/:id', authenticate, requirePermission('roles:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  
  const roleId = req.params.id;
  
  // Check if it's a system role
  const { data: roleData } = await supabaseAdmin
    .from('roles')
    .select('is_system')
    .eq('id', roleId)
    .single();
    
  if (roleData?.is_system) {
    return res.status(403).json({ error: 'Cannot delete system roles' });
  }
  
  // Delete role_permissions first
  await supabaseAdmin.from('role_permissions').delete().eq('role_id', roleId);
  const { error } = await supabaseAdmin
    .from('roles')
    .delete()
    .eq('id', roleId);
    
  if (error) return res.status(500).json({ error: error.message });
  
  await writeAuditEvent({ 
    req, 
    user: req.user!, 
    action: 'role.deleted', 
    entityType: 'Role', 
    entityId: roleId, 
    module: 'admin' 
  });
  
  return res.json({ success: true });
});

// ── User Role Assignments ─────────────────────────────────────────

router.get('/users/:userId/roles', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  
  const userId = req.params.userId;
  
  const { data, error } = await supabaseAdmin.rpc('get_user_roles', {
    p_user_id: userId
  });
  
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ roles: data || [] });
});

router.post('/users/:userId/roles', authenticate, requirePermission('roles:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  
  const userId = req.params.userId;
  const { roleId, propertyId, organizationId, expiresAt } = req.body;
  
  if (!roleId) {
    return res.status(400).json({ error: 'roleId is required' });
  }
  
  try {
    const { data, error } = await supabaseAdmin.rpc('assign_role_to_user', {
      p_user_id: userId,
      p_role_id: roleId,
      p_property_id: propertyId || null,
      p_organization_id: organizationId || null,
      p_assigned_by: req.user?.id || null,
      p_expires_at: expiresAt || null
    });
    
    if (error) return res.status(500).json({ error: error.message });
    
    await writeAuditEvent({ 
      req, 
      user: req.user!, 
      action: 'role.assigned', 
      entityType: 'UserRoleAssignment', 
      entityId: data, 
      module: 'admin', 
      details: { userId, roleId, propertyId, organizationId } 
    });
    
    return res.json({ success: true, assignmentId: data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/users/:userId/roles/:assignmentId', authenticate, requirePermission('roles:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  
  const assignmentId = req.params.assignmentId;
  
  const { error } = await supabaseAdmin
    .from('user_role_assignments')
    .update({ is_active: false })
    .eq('id', assignmentId);
    
  if (error) return res.status(500).json({ error: error.message });
  
  await writeAuditEvent({ 
    req, 
    user: req.user!, 
    action: 'role.unassigned', 
    entityType: 'UserRoleAssignment', 
    entityId: assignmentId, 
    module: 'admin' 
  });
  
  return res.json({ success: true });
});

// ── Backup & Recovery ───────────────────────────────────────────

router.get('/backups', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const status = req.query.status as string;
  let query = supabaseAdmin.from('backup_jobs').select('*').order('initiated_at', { ascending: false }).limit(50);
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ backups: data || [] });
});

router.post('/backups/create', authenticate, requirePermission('settings:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { backupType, storageLocation, metadata } = req.body;
  if (!backupType) return res.status(400).json({ error: 'backupType is required' });
  
  const { data, error } = await supabaseAdmin.rpc('create_backup_job', {
    p_backup_type: backupType,
    p_storage_location: storageLocation || 'supabase',
    p_initiated_by: req.user?.id || null,
    p_metadata: metadata || {}
  });
  if (error) return res.status(500).json({ error: error.message });
  
  await writeAuditEvent({ 
    req, 
    user: req.user!, 
    action: 'backup.created', 
    entityType: 'BackupJob', 
    entityId: data, 
    module: 'admin',
    details: { backupType, storageLocation } 
  });
  return res.json({ success: true, backupId: data });
});

router.get('/backups/statistics', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { data, error } = await supabaseAdmin.rpc('get_backup_statistics');
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ statistics: data });
});

router.get('/backup-schedules', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { data, error } = await supabaseAdmin.from('backup_schedules').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ schedules: data || [] });
});

router.post('/backup-schedules', authenticate, requirePermission('settings:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { scheduleName, backupType, cronSchedule, retentionDays, storageLocation } = req.body;
  if (!scheduleName || !backupType || !cronSchedule) {
    return res.status(400).json({ error: 'scheduleName, backupType, and cronSchedule are required' });
  }
  
  const { data, error } = await supabaseAdmin.rpc('create_backup_schedule', {
    p_schedule_name: scheduleName,
    p_backup_type: backupType,
    p_cron_schedule: cronSchedule,
    p_retention_days: retentionDays || 30,
    p_storage_location: storageLocation || 'supabase',
    p_created_by: req.user?.id || null
  });
  if (error) return res.status(500).json({ error: error.message });
  
  await writeAuditEvent({ 
    req, 
    user: req.user!, 
    action: 'backup_schedule.created', 
    entityType: 'BackupSchedule', 
    entityId: data, 
    module: 'admin',
    details: { scheduleName, backupType, cronSchedule } 
  });
  return res.json({ success: true, scheduleId: data });
});

router.patch('/backup-schedules/:id', authenticate, requirePermission('settings:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { cronSchedule, retentionDays, storageLocation, isActive } = req.body;
  const updates: any = {};
  if (cronSchedule !== undefined) updates.cron_schedule = cronSchedule;
  if (retentionDays !== undefined) updates.retention_days = retentionDays;
  if (storageLocation !== undefined) updates.storage_location = storageLocation;
  if (isActive !== undefined) updates.is_active = isActive;
  updates.updated_at = new Date().toISOString();
  
  const { data, error } = await supabaseAdmin
    .from('backup_schedules')
    .update(updates)
    .eq('id', req.params.id)
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ schedule: data });
});

router.delete('/backup-schedules/:id', authenticate, requirePermission('settings:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { error } = await supabaseAdmin.from('backup_schedules').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
});

router.post('/backups/cleanup', authenticate, requirePermission('settings:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { retentionDays } = req.body;
  const { data, error } = await supabaseAdmin.rpc('cleanup_old_backups', {
    p_retention_days: retentionDays || 30
  });
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true, deletedCount: data });
});

// ── Enhanced Scheduler Engine ─────────────────────────────────────

router.get('/scheduler/jobs', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { data, error } = await supabaseAdmin
    .from('scheduled_jobs_enhanced')
    .select('*')
    .order('next_run_at', { ascending: true, nullsFirst: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ jobs: data || [] });
});

router.post('/scheduler/jobs', authenticate, requirePermission('settings:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { jobName, jobType, jobHandler, scheduleCron, config, priority, timeoutSeconds, retryPolicy } = req.body;
  if (!jobName || !jobType || !jobHandler || !scheduleCron) {
    return res.status(400).json({ error: 'jobName, jobType, jobHandler, and scheduleCron are required' });
  }
  
  const { data, error } = await supabaseAdmin.from('scheduled_jobs_enhanced').insert({
    job_name: jobName,
    job_type: jobType,
    job_handler: jobHandler,
    schedule_cron: scheduleCron,
    config: config || {},
    priority: priority || 5,
    timeout_seconds: timeoutSeconds || 300,
    retry_policy: retryPolicy || { max_retries: 3, retry_delay_seconds: 60 },
    enabled: true,
    created_by: req.user?.id || null,
    next_run_at: null // Will be calculated by enqueue_due_jobs
  }).select().single();
  
  if (error) return res.status(500).json({ error: error.message });
  
  await writeAuditEvent({ 
    req, 
    user: req.user!, 
    action: 'scheduled_job.created', 
    entityType: 'ScheduledJob', 
    entityId: data.id, 
    module: 'admin',
    details: { jobName, jobType, scheduleCron } 
  });
  return res.json({ job: data });
});

router.patch('/scheduler/jobs/:id', authenticate, requirePermission('settings:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { jobName, jobHandler, scheduleCron, config, enabled, priority, timeoutSeconds, retryPolicy } = req.body;
  const updates: any = {};
  if (jobName !== undefined) updates.job_name = jobName;
  if (jobHandler !== undefined) updates.job_handler = jobHandler;
  if (scheduleCron !== undefined) updates.schedule_cron = scheduleCron;
  if (config !== undefined) updates.config = config;
  if (enabled !== undefined) updates.enabled = enabled;
  if (priority !== undefined) updates.priority = priority;
  if (timeoutSeconds !== undefined) updates.timeout_seconds = timeoutSeconds;
  if (retryPolicy !== undefined) updates.retry_policy = retryPolicy;
  updates.updated_at = new Date().toISOString();
  
  const { data, error } = await supabaseAdmin
    .from('scheduled_jobs_enhanced')
    .update(updates)
    .eq('id', req.params.id)
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ job: data });
});

router.delete('/scheduler/jobs/:id', authenticate, requirePermission('settings:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { error } = await supabaseAdmin.from('scheduled_jobs_enhanced').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
});

router.post('/scheduler/jobs-enhanced/:id/trigger', authenticate, requirePermission('settings:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { priority } = req.body;
  
  const { data, error } = await supabaseAdmin.rpc('enqueue_job', {
    p_job_id: req.params.id,
    p_priority: priority || 5,
    p_scheduled_for: new Date().toISOString()
  });
  
  if (error) return res.status(500).json({ error: error.message });
  
  await writeAuditEvent({ 
    req, 
    user: req.user!, 
    action: 'scheduled_job.triggered', 
    entityType: 'ScheduledJob', 
    entityId: req.params.id, 
    module: 'admin' 
  });
  return res.json({ success: true, queueId: data });
});

router.get('/scheduler/jobs/:id/runs', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { data, error } = await supabaseAdmin
    .from('job_runs_enhanced')
    .select('*')
    .eq('job_id', req.params.id)
    .order('started_at', { ascending: false })
    .limit(50);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ runs: data || [] });
});

router.get('/scheduler/queue', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { data, error } = await supabaseAdmin
    .from('job_execution_queue')
    .select('*, scheduled_jobs_enhanced(job_name, job_type)')
    .order('priority', { ascending: true })
    .limit(100);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ queue: data || [] });
});

router.post('/scheduler/enqueue-due', authenticate, requirePermission('settings:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { data, error } = await supabaseAdmin.rpc('enqueue_due_jobs');
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true, enqueuedCount: data });
});

router.get('/scheduler/statistics', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { data, error } = await supabaseAdmin.rpc('get_job_statistics');
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ statistics: data });
});

// ── API Key Management ─────────────────────────────────────────

router.get('/api-keys', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { data, error } = await supabaseAdmin.from('api_keys').select('id, key_prefix, name, scopes, rate_limit, created_by, created_at, expires_at, last_used, disabled').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ keys: data || [] });
});

router.post('/api-keys', authenticate, requirePermission('settings:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { name, scopes, rateLimit, expiresAt } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  const rawKey = `seleda_${crypto.randomUUID().replace(/-/g, '')}${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const keyPrefix = rawKey.slice(0, 12);

  const { data, error } = await supabaseAdmin.from('api_keys').insert({
    key_hash: keyHash,
    key_prefix: keyPrefix,
    name,
    scopes: scopes || [],
    rate_limit: rateLimit || 100,
    created_by: req.user?.id || null,
    expires_at: expiresAt || null,
  }).select('id, key_prefix, name, scopes, rate_limit, created_at, expires_at, disabled').single();

  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'apikey.created', entityType: 'ApiKey', entityId: data.id, module: 'admin' });
  return res.json({ key: data, rawKey });
});

router.patch('/api-keys/:id', authenticate, requirePermission('settings:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { name, scopes, rateLimit, disabled, expiresAt } = req.body;
  const updates: any = {};
  if (name !== undefined) updates.name = name;
  if (scopes !== undefined) updates.scopes = scopes;
  if (rateLimit !== undefined) updates.rate_limit = rateLimit;
  if (disabled !== undefined) updates.disabled = disabled;
  if (expiresAt !== undefined) updates.expires_at = expiresAt;
  const { data, error } = await supabaseAdmin.from('api_keys').update(updates).eq('id', req.params.id).select('id, key_prefix, name, scopes, rate_limit, created_at, expires_at, last_used, disabled').single();
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'apikey.updated', entityType: 'ApiKey', entityId: req.params.id, module: 'admin' });
  return res.json({ key: data });
});

export default router;
