import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types';
import { AuthService } from '../services/authService';

// Extend Express Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
        first_name: string;
        last_name: string;
        coach_id?: string;
      };
    }
  }
}

const authService = new AuthService();

// Basic authentication middleware
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided or invalid format.',
        error: 'Authentication required'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = authService.verifyToken(token);
      req.user = decoded;
      next();
    } catch (tokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error: 'Authentication failed'
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: 'Internal server error'
    });
  }
};

// Role-based authorization middleware
export const authorize = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user information found'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
        error: `Required roles: ${allowedRoles.join(', ')}`
      });
      return;
    }

    next();
  };
};

// Admin only middleware
export const adminOnly = authorize([UserRole.ADMIN]);

// Admin and Coach middleware
export const adminOrCoach = authorize([UserRole.ADMIN, UserRole.COACH]);

// Admin, Coach, and Client middleware
export const authenticatedUser = authorize([UserRole.ADMIN, UserRole.COACH, UserRole.CLIENT]);

// Optional authentication (allows guests)
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token provided, but that's okay for optional auth
    next();
    return;
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = authService.verifyToken(token);
    req.user = decoded;
  } catch (error) {
    // Invalid token, but we'll continue without user info
    console.log('Optional auth failed:', error);
  }
  
  next();
};

// Resource ownership middleware for personal details
export const checkPersonalDetailsAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user information found'
      });
      return;
    }

    const personalId = req.params.personalId || req.params.id;
    
    if (!personalId) {
      res.status(400).json({
        success: false,
        message: 'Personal ID is required',
        error: 'Missing personal ID parameter'
      });
      return;
    }

    const hasAccess = await authService.canAccessPersonalDetails(
      req.user.userId,
      req.user.role,
      personalId
    );

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to access this resource.',
        error: 'Insufficient permissions for this personal details record'
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authorization check failed',
      error: 'Internal server error'
    });
  }
};

// Check if user can manage personal details (create/update)
export const checkPersonalDetailsManagement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user information found'
      });
      return;
    }

    // For create operations, check the coach_id in the request body
    // For update operations, we might need to check existing data
    const coachId = req.body?.coach_id;
    
    const canManage = await authService.canManagePersonalDetails(
      req.user.userId,
      req.user.role,
      coachId
    );

    if (!canManage) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to manage this resource.',
        error: 'Insufficient permissions to create/modify personal details'
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authorization check failed',
      error: 'Internal server error'
    });
  }
}; 