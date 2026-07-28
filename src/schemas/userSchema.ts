import { z } from 'zod';
import { idSchema, emailSchema, phoneSchema } from './common';

// User validation (backend API)
export const userApiSchema = z.object({
  id: idSchema.optional(),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: emailSchema,
  full_name: z.string().min(1, 'Full name is required'),
  role: z.string().min(1, 'Role is required').default('guest'),
  custom_role_id: z.string().optional().nullable(),
  department: z.string().optional(),
  is_active: z.boolean().default(true),
  allowed_tabs: z.array(z.string()).optional(),
  allowed_settings: z.record(z.string(), z.boolean()).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

export type UserApiInput = z.infer<typeof userApiSchema>;

// Role validation (backend API)
export const roleApiSchema = z.object({
  id: idSchema.optional(),
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
  is_superuser: z.boolean().default(false),
  is_active: z.boolean().default(true),
  permissions: z.union([
    z.record(z.string(), z.array(z.string())),
    z.array(z.string()),
  ]).optional(),
  moduleAccess: z.record(z.string(), z.any()).optional(),
});

export type RoleApiInput = z.infer<typeof roleApiSchema>;

// Permission validation (backend API)
export const permissionApiSchema = z.object({
  id: idSchema.optional(),
  code: z.string().min(1, 'Permission code is required'),
  name: z.string().min(1, 'Permission name is required'),
  description: z.string().optional(),
  module: z.string().min(1, 'Module is required'),
});

export type PermissionApiInput = z.infer<typeof permissionApiSchema>;

// User Role assignment validation (backend API)
export const userRoleApiSchema = z.object({
  id: idSchema.optional(),
  user_id: idSchema,
  role_id: idSchema,
  assigned_by: idSchema.optional(),
});

export type UserRoleApiInput = z.infer<typeof userRoleApiSchema>;

// Password change validation
export const passwordChangeSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters'),
  confirm_password: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;

// Password reset validation
export const passwordResetSchema = z.object({
  email: emailSchema,
});

export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
