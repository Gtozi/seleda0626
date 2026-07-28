/**
 * Password Policy Validation
 * Enforces password complexity rules based on global_settings.password_complexity
 */

export interface PasswordPolicy {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireDigit?: boolean;
  requireSpecialChar?: boolean;
  preventReuse?: number;
}

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

const DEFAULT_POLICY: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSpecialChar: true,
  preventReuse: 3,
};

const SPECIAL_CHARS = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/;

export function resolvePolicy(rawPolicy: any): PasswordPolicy {
  if (!rawPolicy || typeof rawPolicy !== 'object') return DEFAULT_POLICY;
  if (typeof rawPolicy === 'string') {
    try {
      return resolvePolicy(JSON.parse(rawPolicy));
    } catch {
      return DEFAULT_POLICY;
    }
  }
  return {
    minLength: Number(rawPolicy.minLength) || DEFAULT_POLICY.minLength!,
    requireUppercase: rawPolicy.requireUppercase ?? DEFAULT_POLICY.requireUppercase,
    requireLowercase: rawPolicy.requireLowercase ?? DEFAULT_POLICY.requireLowercase,
    requireDigit: rawPolicy.requireDigit ?? DEFAULT_POLICY.requireDigit,
    requireSpecialChar: rawPolicy.requireSpecialChar ?? DEFAULT_POLICY.requireSpecialChar,
    preventReuse: Number(rawPolicy.preventReuse) || DEFAULT_POLICY.preventReuse!,
  };
}

export function validatePassword(
  password: string,
  policy?: PasswordPolicy | null
): PasswordValidationResult {
  const p = policy || DEFAULT_POLICY;
  const errors: string[] = [];

  if (!password || password.length < (p.minLength || 8)) {
    errors.push(`Password must be at least ${p.minLength || 8} characters long`);
  }
  if (p.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (p.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (p.requireDigit && !/\d/.test(password)) {
    errors.push('Password must contain at least one digit');
  }
  if (p.requireSpecialChar && !SPECIAL_CHARS.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return { valid: errors.length === 0, errors };
}
