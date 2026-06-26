/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Secure Authentication Library
 * Implements JWT-based authentication with httpOnly cookies
 */

import { User } from '../types/erp';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
  requiresMFA?: boolean;
  forcePasswordChange?: boolean;
}

/**
 * Login with email and password
 * Stores tokens in httpOnly cookies via server endpoint
 */
export const login = async (
  email: string, 
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important: sends cookies
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Authentication failed',
      };
    }

    // Tokens are stored in httpOnly cookies by the server
    // We only store non-sensitive user data in memory
    return {
      success: true,
      user: data.user,
      requiresMFA: data.requiresMFA,
      forcePasswordChange: data.forcePasswordChange,
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
};

/**
 * Logout and clear session
 */
export const logout = async (): Promise<void> => {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
};

/**
 * Refresh access token using refresh token
 * Called automatically when access token expires
 */
export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      return false;
    }

    // New access token is set in httpOnly cookie
    return true;
  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  }
};

/**
 * Verify current session is valid
 */
export const verifySession = async (): Promise<User | null> => {
  try {
    const response = await fetch('/api/auth/verify', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
};

/**
 * Verify MFA code
 */
export const verifyMFA = async (code: string): Promise<AuthResponse> => {
  try {
    const response = await fetch('/api/auth/verify-mfa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ code }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'MFA verification failed',
      };
    }

    return {
      success: true,
      user: data.user,
    };
  } catch (error) {
    console.error('MFA verification error:', error);
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
};

/**
 * Change password
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Password change failed',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Password change error:', error);
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (
  email: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch('/api/auth/request-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Reset request failed',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Password reset request error:', error);
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Password reset failed',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
};
