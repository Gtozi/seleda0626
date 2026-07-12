/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Authentication and Authorization Middleware
 * Centralized authentication logic to eliminate duplication across API endpoints
 */

import { Request, Response, NextFunction } from 'express';
import type { User } from '../../types/erp';
import { getRequestUser, userCan } from '../authHelpers';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Authentication middleware - validates session and attaches user to request
 * Use this for any endpoint that requires authentication
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getRequestUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(401).json({ error: 'Not authenticated' });
  }
};

/**
 * Permission-based authorization middleware
 * Use this for endpoints that require specific permissions
 * @param action - The permission action to check (e.g., 'reservation:check_in')
 */
export const requirePermission = (action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const allowed = await userCan(req.user, action);
      if (!allowed) {
        return res.status(403).json({ 
          error: 'Insufficient privileges',
          required: action 
        });
      }

      next();
    } catch (error) {
      console.error('Authorization middleware error:', error);
      return res.status(500).json({ error: 'Authorization error' });
    }
  };
};

/**
 * Role-based authorization middleware
 * Use this for endpoints restricted to specific roles
 * @param roles - Array of allowed roles
 */
export const requireRole = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          error: 'Insufficient privileges',
          required: roles,
          current: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('Role authorization middleware error:', error);
      return res.status(500).json({ error: 'Authorization error' });
    }
  };
};

/**
 * Active account status middleware
 * Ensures user account is active and not locked/pending
 */
export const requireActiveAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const inactiveStatuses = ['Inactive', 'Pending', 'Suspended', 'Locked'];
    if (inactiveStatuses.includes(req.user.status)) {
      return res.status(403).json({ 
        error: `Account is ${req.user.status}`,
        status: req.user.status
      });
    }

    next();
  } catch (error) {
    console.error('Account status middleware error:', error);
    return res.status(500).json({ error: 'Authorization error' });
  }
};

/**
 * Combined authentication and authorization middleware
 * Convenience function that chains authenticate + requirePermission
 */
export const authenticateWithPermission = (action: string) => {
  return [authenticate, requirePermission(action)];
};

/**
 * Combined authentication and role check middleware
 * Convenience function that chains authenticate + requireRole
 */
export const authenticateWithRole = (...roles: string[]) => {
  return [authenticate, requireRole(...roles)];
};
